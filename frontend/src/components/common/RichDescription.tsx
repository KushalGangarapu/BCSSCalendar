import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';
import { isSafeUrl } from '../../utils/linkUtils';

interface RichDescriptionProps {
    content?: string | null;
    className?: string;
    style?: React.CSSProperties;
}

export const RichDescription: React.FC<RichDescriptionProps> = ({ content, className = '', style }) => {
    if (!content || !content.trim()) return null;

    return (
        <div className={`rich-description ${className}`} style={style}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ href, children, ...props }) => {
                        const safe = isSafeUrl(href);
                        const finalHref = safe ? href : '#';

                        return (
                            <a
                                href={finalHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="event-inline-link"
                                onClick={(e) => e.stopPropagation()}
                                {...props}
                            >
                                <span>{children}</span>
                                <ExternalLink size={12} style={{ display: 'inline-block', verticalAlign: '-1px', flexShrink: 0 }} />
                            </a>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
