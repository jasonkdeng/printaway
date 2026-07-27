export const headerControlBaseClassName = "inline-flex h-6 shrink-0 self-center items-center justify-center px-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors motion-reduce:transition-none";

export const headerNavigationControlClassName = `${headerControlBaseClassName} border border-transparent text-aluminum hover:border-aluminum hover:text-bone focus-visible:border-aluminum focus-visible:text-bone focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet`;

export const headerOutlinedControlClassName = `${headerControlBaseClassName} border border-aluminum text-bone hover:border-bone hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet`;

// Google specifies a white surface for its standard-colour "G" mark. This is
// intentionally an external-provider exception to Printaway's dark controls.
export const googleSignInControlClassName = "inline-flex h-6 shrink-0 self-center items-center justify-center gap-[10px] border border-[#747775] bg-white px-[12px] font-body text-[14px] font-medium leading-none text-[#1f1f1f] transition-colors hover:bg-[#f8fafd] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet motion-reduce:transition-none";
