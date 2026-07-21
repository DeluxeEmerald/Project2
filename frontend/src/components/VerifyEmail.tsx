import { useEffect, useState } from 'react';
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
            <button className="bg-main shadow-lg shadow-main/50 rounded-lg w-80 hover:bg-wood cursor-pointer"
            onClick={toLogin}>Back to Login</button>
            </div>
        </div>
  );
}

export default VerifyEmail;