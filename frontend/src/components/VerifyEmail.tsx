import { useEffect, useState } from 'react';
<<<<<<< HEAD
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
            }
            catch (error:any) {
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
=======
import { useSearchParams } from 'react-router-dom';
import { buildPath } from './Path';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying...');

  function toLogin(){
        window.location.href = '/';
    }

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('Verification Failed');
      return;
    }

    fetch(buildPath('api/verifyemail'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Calling...");
        if (data.verified) {
          setStatus('Your email has been verified! You can now log in.');
        } else {
          setStatus(data.error || 'Verification failed.');
        }
      })
      .catch(() => setStatus('Something went wrong verifying your email.'));
  }, [searchParams]);

  return(
    <div id="loginDiv" className='flex flex-col items-center bg-white text-black rounded-3xl p-8 max-w-m mx-auto h-100 gap-4 centered mt-20'>
            <div>
                <p>{status}</p>
            </div>
            <div>
            <button className="bg-main text-white hover:text-black shadow-lg 
            shadow-main/50 rounded-lg w-80 hover:bg-wood cursor-pointer border-2 border-black"
            onClick={toLogin}>Back to Login</button>
            </div>
        </div>
  );
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
}

export default VerifyEmail;