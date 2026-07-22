import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildPath } from './Path';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying your email...');
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const verificationToken = searchParams.get('token');

        async function verifyEmail() {
            if (!verificationToken) {
                setMessage('Missing verification token.');
                return;
            }

            try {
                const response = await fetch(buildPath('api/verifyemail'), {
                    method: 'POST',
                    body: JSON.stringify({ token: verificationToken }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const txt = await response.text();
                const res = JSON.parse(txt);

                if (res.error && res.error.length > 0) {
                    setMessage(res.error);
                    return;
                }

                setIsVerified(true);
                setMessage('Your email has been verified.');
            } catch (error: any) {
                setMessage(error.toString());
            }
        }

        void verifyEmail();
    }, [searchParams]);

    return (
        <div className='app-shell'>
            <div className='page-frame'>
                <div className='notice-card centered stack-lg mt-20 text-black'>
                    <div className='stack'>
                        <p className='brand-mark'>Verification</p>
                        <h2 className='auth-title'>{isVerified ? 'Email verified' : 'Verifying account'}</h2>
                        <p className='auth-copy'>{message}</p>
                    </div>
                    {isVerified && (
                        <button className='primary-button' onClick={() => navigate('/')}>Back to Login</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;