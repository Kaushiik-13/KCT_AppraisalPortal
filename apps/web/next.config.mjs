/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Do not auto-generate an AGENTS.md in the workspace; governance files are managed explicitly.
  agentRules: false,
};

export default nextConfig;
