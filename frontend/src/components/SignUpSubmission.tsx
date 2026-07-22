function SignUpSubmission() {
    function toLogin() {
        window.location.href = '/';
    }

    return (
        <div className='app-shell'>
            <div className='page-frame'>
                <div className='notice-card centered stack-lg mt-20 text-black'>
                    <div className='stack'>
                        <h2 className='auth-title'>Check your inbox</h2>
                        <p className='auth-copy'>A verification email has been sent. If it does not show up right away, check your spam folder and return once your account is verified.</p>
                    </div>
                    <button className='primary-button' onClick={toLogin}>Back to Login</button>
                </div>
            </div>
        </div>
    );
}

export default SignUpSubmission;