import Link from 'next/link';

const CLAUDE_DIRECTORY_URL = 'https://claude.ai/directory/rsainsights';
const CHATGPT_PLUGIN_URL =
    'https://chatgpt.com/plugins/plugin_asdk_app_6ad0c19aaa448191806eefd29e8edec7';
const DOCS_URL = '/docs';

const BADGES = [
    {
        href: CHATGPT_PLUGIN_URL,
        src: '/badges/get-it-on-chatgpt.svg',
        alt: 'Get it on ChatGPT',
    },
    {
        href: CLAUDE_DIRECTORY_URL,
        src: '/badges/connect-on-claude.svg',
        alt: 'Connect on Claude',
    },
];

const PLATFORMS = [
    {
        name: 'ChatGPT',
        href: CHATGPT_PLUGIN_URL,
        icon: '/badges/openai-mark.svg',
        external: true,
    },
    {
        name: 'Claude',
        href: CLAUDE_DIRECTORY_URL,
        icon: '/badges/claude-mark.svg',
        external: true,
    },
    {
        name: 'Muse',
        href: DOCS_URL,
        icon: '/badges/meta-mark.svg',
        external: false,
    },
    {
        name: 'Gemini',
        href: DOCS_URL,
        icon: '/badges/gemini-mark.svg',
        external: false,
    },
];

export default function AiConnect() {
    return (
        <section className="ai-connect" aria-label="Connect Rotaract Insights to AI assistants">
            <div className="ai-connect-ctas">
                {BADGES.map((badge) => (
                    <a
                        key={badge.alt}
                        href={badge.href}
                        className="ai-connect-badge-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src={badge.src}
                            alt={badge.alt}
                            width={200}
                            height={60}
                            className="ai-connect-badge"
                        />
                    </a>
                ))}
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
