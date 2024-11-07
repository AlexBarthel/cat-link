const Result = {
    Success: 0,
    DLLNotFound: 1,
    OpenProcFail: 2,
    AllocFail: 3,
    LoadLibFail: 4,
    AlreadyInjected: 5,
    ProcNotOpen: 6,
    Unknown: 7
};

const koffi = require('koffi');
const kernel32 = koffi.load('kernel32.dll');

const PROCESS_QUERY_INFORMATION = 0x0400;
const PROCESS_VM_READ = 0x0010;
const PROCESS_VM_WRITE = 0x0020;

const OpenProcess = kernel32.func('uintptr_t OpenProcess(uint32 dwDesiredAccess, int bInheritHandle, uint32 dwProcessId)');
const VirtualQueryEx = kernel32.func('size_t VirtualQueryEx(uintptr_t hProcess, uintptr_t lpAddress, uintptr_t lpBuffer, size_t dwLength)');
const CloseHandle = kernel32.func('int CloseHandle(uintptr_t hObject)');

async function getMemoryAddressesWindows(pid) {
    const hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, 0, pid);
    if (!hProcess) {
        console.error("Could not open process");
        return [];
    }

    const memoryRanges = [];
    let address = 0n;

    const MEMORY_BASIC_INFORMATION = koffi.struct('MEMORY_BASIC_INFORMATION', {
        BaseAddress: 'uintptr_t',
        AllocationBase: 'uintptr_t',
        AllocationProtect: 'uint32',
        RegionSize: 'size_t',
        State: 'uint32',
        Protect: 'uint32',
        Type: 'uint32'
    })
    const LMEMORY_BASIC_INFORMATION = koffi.sizeof(MEMORY_BASIC_INFORMATION)
    const PMEMORY_BASIC_INFORMATION = koffi.decode(MEMORY_BASIC_INFORMATION, "uintptr_t")

    console.log(`hProcess (uintptr_t) = ${hProcess}`)
    console.log(`lpAddress (uintptr_t) = ${address}`)
    console.log(`lpBuffer (uintptr_t) = ${PMEMORY_BASIC_INFORMATION}`)
    console.log(`dwLength (size_t) = ${LMEMORY_BASIC_INFORMATION}`)

    while (VirtualQueryEx(hProcess, address, PMEMORY_BASIC_INFORMATION, LMEMORY_BASIC_INFORMATION) !== 0) {
        console.log(MEMORY_BASIC_INFORMATION)

        const baseAddress = MEMORY_BASIC_INFORMATION.BaseAddress;
        const regionSize = MEMORY_BASIC_INFORMATION.RegionSize;

        console.log(`baseAddress = ${baseAddress}`)
        console.log(`regionSize = ${regionSize}`)

        memoryRanges.push({
            start: `0x${baseAddress.toString(16)}`,
            end: `0x${(baseAddress + regionSize).toString(16)}`
        });
        address = BigInt(baseAddress) + BigInt(regionSize);
    }

    console.log(memoryRanges)

    CloseHandle(hProcess);
    return memoryRanges;
}


module.exports = getMemoryAddressesWindows
