import { Card } from "./card";

export function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full p-6 flex justify-between cursor-default items-center bg-white border-b-2 border-border shadow-[0_4px_0_0_var(--border)]">
      <h1>
        jsta<span className="px-3 py-1.5 bg-chart-3 text-white">link</span>.page
      </h1>
      <Card className="hover:rotate-z-3 px-4 py-2 transition duration-200 bg-main">
        No Account Needed!
      </Card>
    </div>
  );
}
