import Link from 'next/link';

const CLAUDE_DIRECTORY_URL = 'https://claude.ai/directory/rsainsights';
const DOCS_URL = '/docs';

const PLATFORMS = [
    {
        name: 'Claude',
        href: CLAUDE_DIRECTORY_URL,
        icon: '/badges/claude-mark.svg',
        external: true,
    },
    {
        name: 'ChatGPT',
        href: DOCS_URL,
        icon: '/badges/openai-mark.svg',
        external: false,
    },
    {
        name: 'Muse',
        href: DOCS_URL,
        icon: '/badges/meta-mark.svg',
        external: false,
    },
    {
        name: 'Gemini Spark',
        href: DOCS_URL,
        icon: '/badges/gemini-mark.svg',
        external: false,
    },
];

export default function AiConnect() {
    return (
        <section className="ai-connect" aria-label="Connect Rotaract Insights to AI assistants">
            <div className="ai-connect-ctas">
                <a
                    href={CLAUDE_DIRECTORY_URL}
                    className="ai-connect-badge-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src="/badges/connect-on-claude.svg"
                        alt="Connect on Claude"
                        width={200}
                        height={60}
                        className="ai-connect-badge"
                    />
                </a>
            </div>

            <div className="ai-connect-lives">
                <p className="ai-connect-lives-label">WORKS WITH</p>
                <div className="ai-connect-lives-row">
                    <div className="ai-connect-platforms">
                        {PLATFORMS.map((platform) => {
                            const className = 'ai-connect-platform';
                            const icon = (
                                <img
                                    src={platform.icon}
                                    alt=""
                                    width={18}
                                    height={18}
                                />
                            );
                            if (platform.external) {
                                return (
                                    <a
                                        key={platform.name}
                                        href={platform.href}
                                        className={className}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {icon}
                                        <span>{platform.name}</span>
                                    </a>
                                );
                            }
                            return (
                                <Link
                                    key={platform.name}
                                    href={platform.href}
                                    className={className}
                                >
                                    {icon}
                                    <span>{platform.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                    <Link href={DOCS_URL} className="ai-connect-mcp-note">
                        + any MCP client
                    </Link>
                </div>
            </div>
        </section>
    );
}
