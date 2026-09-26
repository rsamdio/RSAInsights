'use client';

import { useState } from 'react';

export default function ContactSupportForm() {
    const [status, setStatus] = useState('idle'); // idle | submitting | submitted
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'Data & Analytics Inquiry',
        district: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate immediate ticket creation and client acknowledgement
        setTimeout(() => {
            setStatus('submitted');
        }, 600);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            category: 'Data & Analytics Inquiry',
            district: '',
            subject: '',
            message: ''
        });
        setStatus('idle');
    };

    if (status === 'submitted') {
        const mailtoSubject = encodeURIComponent(`[${formData.category}] ${formData.subject}`);
        const mailtoBody = encodeURIComponent(`From: ${formData.name} (${formData.email})\nDistrict: ${formData.district || 'N/A'}\n\n${formData.message}`);
        const mailtoLink = `mailto:info@rsamdio.org?subject=${mailtoSubject}&body=${mailtoBody}`;

        return (
            <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#166534' }}>
                    Support Request Received
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.6', color: '#15803d', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Thank you, <strong>{formData.name}</strong>. Your inquiry regarding <strong>{formData.subject}</strong> has been logged. Our analytics and support team will review your message within 24 to 48 hours.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href={mailtoLink} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#16a34a',
                        color: '#ffffff',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}>
                        Send Direct Email Backup ✉️
                    </a>
                    <button onClick={resetForm} style={{
                        background: '#ffffff',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>
                        Submit Another Inquiry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                        Your Full Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rtr. Rahul Sharma"
                        style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                        Email Address *
                    </label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@domain.org"
                        style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                        Support Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            background: '#ffffff',
                            fontFamily: 'inherit'
                        }}
                    >
                        <option value="Data & Analytics Inquiry">Data & Analytics Inquiry</option>
                        <option value="Dues Reconciliation / Arrears">Dues Reconciliation / Arrears</option>
                        <option value="Missing Officer Reporting">Missing Officer Reporting</option>
                        <option value="Model Context Protocol (MCP) AI Integration">Model Context Protocol (MCP) AI Integration</option>
                        <option value="REST API Integration">REST API Integration</option>
                        <option value="Bug Report / Platform Feedback">Bug Report / Platform Feedback</option>
                        <option value="General Leadership Inquiry">General Leadership Inquiry</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                        Rotary District Number (Optional)
                    </label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="e.g. 3000, 3191, 3292"
                        style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Subject / Summary *
                </label>
                <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your question or issue"
                    style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Message Details *
                </label>
                <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please include relevant club names, charter IDs, district context, or error messages..."
                    style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                    }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    style={{
                        background: 'var(--primary, #0f4c81)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: status === 'submitting' ? 'wait' : 'pointer',
                        opacity: status === 'submitting' ? 0.7 : 1,
                        transition: 'background 0.15s ease'
                    }}
                >
                    {status === 'submitting' ? 'Submitting...' : 'Submit Support Inquiry →'}
                </button>
            </div>
        </form>
    );
}
