const Footer = () => {
  return (
    <footer className="shrink-0 w-full pt-4 text-center text-sm text-[var(--muted-foreground)]">
      <p className="text-xs text-[var(--muted-foreground)]">
        created by{" "}
        <a
          className="text-[var(--foreground)] hover:underline"
          href="https://f-vdev.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          fvdev
        </a>{" "}
        for devs.
      </p>
    </footer>
  );
};

export default Footer;
