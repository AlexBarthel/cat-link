const koffi = require('koffi');

const PROCESS_QUERY_INFORMATION = 0x0400;
const PROCESS_VM_READ = 0x0010;
const PROCESS_VM_WRITE = 0x0020;

const kernel32 = koffi.load('kernel32.dll');

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
    let address = 0;

    const mbiSize = koffi.sizeof(MEMORY_BASIC_INFORMATION);
    const mbi = koffi.alloc(MEMORY_BASIC_INFORMATION, mbiSize);
    console.log("\n==============================================")
    console.log("TODO: Dereference this external value to its\npointer, then pass the pointer as the 3rd\nargument to VirtualQueryEx. (api.js 36)")
    console.log(mbi)
    console.log("==============================================\n")
    while (VirtualQueryEx(hProcess, address, mbi, mbiSize) !== 0) {
        memoryRanges.push({
            start: `0x${mbi.BaseAddress.toString(16)}`,
            end: `0x${(mbi.BaseAddress + mbi.RegionSize).toString(16)}`
        });
        address = mbi.BaseAddress + mbi.RegionSize;
    }

    CloseHandle(hProcess);
    return memoryRanges;
}


module.exports = getMemoryAddressesWindows
