type LeadFormProps = {
  purpose: "demo" | "contact" | "support";
};

export function LeadForm({ purpose }: LeadFormProps) {
  const isSupport = purpose === "support";
  return (
    <form
      className="card grid gap-4 p-5"
      action={isSupport ? "/support" : purpose === "demo" ? "/demo" : "/contact"}
      method="post"
    >
      <label className="grid gap-2 text-sm font-medium">
        Full name
        <input className="field" name="name" type="text" autoComplete="name" required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Work email
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      {!isSupport ? (
        <label className="grid gap-2 text-sm font-medium">
          Company
          <input
            className="field"
            name="company"
            type="text"
            autoComplete="organization"
            required
          />
        </label>
      ) : null}
      {purpose === "demo" ? (
        <label className="grid gap-2 text-sm font-medium">
          Preferred demo time
          <input
            className="field"
            name="preferredTime"
            type="text"
            placeholder="Tuesday afternoon"
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        Message
        <textarea className="field min-h-28" name="message" required={isSupport} />
      </label>
      <button className="rounded-md bg-[#176b53] px-4 py-3 font-semibold text-white" type="submit">
        {purpose === "demo"
          ? "Request demo"
          : purpose === "support"
            ? "Request support"
            : "Contact sales"}
      </button>
      <p className="text-xs leading-5 text-[#5e6b66]">
        This fixture displays forms for extraction only. AgentLayer does not submit forms during
        scans.
      </p>
    </form>
  );
}
