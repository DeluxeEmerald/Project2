import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buildPath } from './Path';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    async function submitPassword(): Promise<void> {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('Missing or invalid reset token. Please request a new reset email.');
            return;
        }

        const obj = { token: token, password: password };
        const js = JSON.stringify(obj);

        try {
            if (validatePassword()) {
                setIsSubmitting(true);
                const response = await fetch(buildPath('api/resetpassword'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: js,
                });

                if (!response.ok) {
                    setStatus(response.status.toString());
                    return;
                }

                const res = JSON.parse(await response.text());

                if (res.error && res.error.length > 0) {
                    setStatus(res.error);
                } else {
                    setStatus('Password reset complete. You can log in now.');
                }
            }
        } catch (error: any) {
            setStatus(error.toString());
        } finally {
            setIsSubmitting(false);
        }
    }

    function toLogin(){
        navigate('/');
    }
    

    function validatePassword(){
        const minLength = 8;
        const upperCase = /[A-Z]/;
        const specialCharacters = /[!@#$%^&*(),.?":{}|<>_\-+=[\];'~`]/g;

        const nextErrors: string[] = [];

        if (password.length < minLength){
            nextErrors.push('Password must be at least 8 characters long.');
        }

        if (!upperCase.test(password)){
            nextErrors.push('Password must contain at least 1 uppercase letter.');
        }
        
        const specialCharMatches = password.match(specialCharacters) || [];
        if (specialCharMatches.length < 2) {
            nextErrors.push('Password must contain at least 2 special characters.');
        }

        setErrors(nextErrors);
        return nextErrors.length === 0;
    }

    return (
        <section className='auth-layout'>
            <div className='hero-panel'>
                <span className='hero-kicker'>Set New Password</span>
                <h2 className='hero-heading'>Protect your account again.</h2>
                <p className='hero-copy'>
                    Choose a strong replacement password to finish account recovery.
                </p>
                <div className='hero-stats'>
                    <div className='hero-stat'>
                        <strong>8+</strong>
                        <span>Minimum characters required.</span>
                    </div>
                    <div className='hero-stat'>
                        <strong>A-Z</strong>
                        <span>At least one uppercase letter.</span>
                    </div>
                    <div className='hero-stat'>
                        <strong>2</strong>
                        <span>Include two special characters.</span>
                    </div>
                </div>
            </div>

            <div id='loginDiv' className='auth-card stack-lg'>
                <div>
                    <h2 className='auth-title'>Create a new password</h2>
                    <p className='auth-copy'>Your reset link is one-time use. Submit once to complete reset.</p>
                </div>

                <div className='auth-form'>
                    <label>
                        <span className='field-label'>New Password</span>
                        <input
                            type='password'
                            id='password'
                            placeholder='Enter your new password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='text-input'
                        />
                    </label>

                    <button
                        type='button'
                        className='primary-button'
                        onClick={submitPassword}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>

                    {status && <p className='auth-message'>{status}</p>}

                    {errors.length > 0 && (
                        <div className='error-list'>
                            {errors.map((err, index) => (
                                <p key={index}>{err}</p>
                            ))}
                        </div>
                    )}

                    <button onClick={toLogin} className='secondary-button'>
                        Back to Login
                    </button>
                </div>
            </div>
        </section>
    );
}

export default ResetPassword;