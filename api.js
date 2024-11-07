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

const MEMORY_BASIC_INFORMATION = koffi.struct('MEMORY_BASIC_INFORMATION', {
    BaseAddress: 'uintptr_t',
    AllocationBase: 'uintptr_t',
    AllocationProtect: 'uint32',
    RegionSize: 'size_t',
    State: 'uint32',
    Protect: 'uint32',
    Type: 'uint32'
});

async function getMemoryAddressesWindows(pid) {
    const hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, 0, pid);
    if (!hProcess) {
        console.error("Could not open process");
        return [];
    }

    const memoryRanges = [];
    let address = 0n;

    const mbiBufferSize = koffi.sizeof(MEMORY_BASIC_INFORMATION)
    const mbiBuffer = koffi.alloc(MEMORY_BASIC_INFORMATION, mbiBufferSize)
    const mbiPointer = koffi.decode(mbiBuffer, "uintptr_t")

    console.log(`hProcess (uintptr_t) = ${hProcess}`)
    console.log(`lpAddress (uintptr_t) = ${address}`)
    console.log(`lpBuffer (uintptr_t) = ${mbiPointer}`)
    console.log(`dwLength (size_t) = ${mbiBufferSize}`)

    while (VirtualQueryEx(hProcess, address, mbiPointer, mbiBufferSize) !== 0) {
        const baseAddress = mbi.read('BaseAddress'); // Read fields directly from `mbi`
        const regionSize = mbi.read('RegionSize');

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
