import { useState } from 'react';
import { buildPath } from './Path';
import { useNavigate } from 'react-router-dom';

function RequestReset() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

    async function callReset(){
    if (emailVerify()) {
      return;
        }
    const obj = { email: email };
    const js = JSON.stringify(obj);

    try {
      setIsSubmitting(true);
      const response = await fetch(buildPath('api/requestpasswordreset'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = JSON.parse(await response.text());
      if (res.error && res.error.length > 0) {
        setMessage(res.error);
      } else {
        setMessage("Reset link sent. If you don't see it, check your spam folder.");
            }
    } catch (error: any) {
      setMessage(error.toString());
    } finally {
      setIsSubmitting(false);
        }
    }

    function toLogin(){
    navigate('/');
    }

    function emailVerify(){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email.');
      return true;
        }
    return false;
    }

  return (
    <section className='auth-layout'>
      <div className='hero-panel'>
        <span className='hero-kicker'>Password Help</span>
        <h2 className='hero-heading'>Recover your account quickly.</h2>
        <p className='hero-copy'>
          Enter the email tied to your account and we will send a secure reset link.
        </p>
        <div className='hero-stats'>
          <div className='hero-stat'>
            <strong>1</strong>
            <span>Submit your email address.</span>
          </div>
          <div className='hero-stat'>
            <strong>2</strong>
            <span>Open the reset link in your inbox.</span>
          </div>
          <div className='hero-stat'>
            <strong>3</strong>
            <span>Set a new secure password.</span>
          </div>
        </div>
      </div>

      <div id='loginDiv' className='auth-card stack-lg'>
        <div>
          <h2 className='auth-title'>Reset request</h2>
          <p className='auth-copy'>We will email your one-time password reset link.</p>
        </div>

        <div className='auth-form'>
          <label>
            <span className='field-label'>Email Address</span>
            <input
              type='email'
              id='email'
              placeholder='you@example.com'
              className='text-input'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button
            type='button'
            className='primary-button'
            onClick={callReset}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </button>

          {message && <span id='loginResult' className='auth-message'>{message}</span>}

          <button type='button' className='secondary-button' onClick={toLogin}>
            Back to Login
          </button>
        </div>
      </div>
    </section>
  );
}

export default RequestReset;