export const headerControlBaseClassName = "inline-flex h-6 shrink-0 self-center items-center justify-center px-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors motion-reduce:transition-none";

export const headerNavigationControlClassName = `${headerControlBaseClassName} border border-transparent text-aluminum hover:border-aluminum hover:text-bone focus-visible:border-aluminum focus-visible:text-bone focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet`;

export const headerOutlinedControlClassName = `${headerControlBaseClassName} border border-aluminum text-bone hover:border-bone hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet`;

// Google's approved dark treatment keeps the provider action recognizable
// without introducing an abrupt white surface into Printaway's header.
export const googleSignInControlClassName = "inline-flex h-6 shrink-0 self-center items-center justify-center gap-[10px] rounded-[8px] border border-[#8e918f] bg-[#131314] px-[12px] font-body text-[14px] font-medium leading-none text-[#e3e3e3] transition-colors duration-150 ease-out hover:border-[#a9aca9] hover:bg-[#1f1f21] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet motion-reduce:transition-none";
