import React from 'react';

const Loading = () => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Matches your h-[100vh]
        fontSize: '2.25rem', // Matches text-4xl (4xl = 2.25rem)
    };

    const spinnerStyle = {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #a14dfd',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '10px', // Space between spinner and text
    };

    return (
        <div style={containerStyle}>
            <div style={spinnerStyle}></div>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Loading;