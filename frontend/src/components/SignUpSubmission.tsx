function SignUpSubmission()
{
    function toLogin(){
        window.location.href = '/';
    }

    return(
<<<<<<< HEAD
        <div className='app-shell'>
            <div className='page-frame'>
                <div className='notice-card centered stack-lg mt-20 text-black'>
                    <div className='stack'>
                        <h2 className='auth-title'>Check your inbox</h2>
                        <p className='auth-copy'>A verification email has been sent. If it does not show up right away, check your spam folder and return once your account is verified.</p>
                    </div>
                    <button className='primary-button' onClick={toLogin}>Back to Login</button>
                </div>
=======
        <div id="loginDiv" className='flex flex-col items-center bg-white text-black rounded-3xl p-8 max-w-m mx-auto h-100 gap-4 centered mt-20'>
            <div>
                <p>You have been sent a verification email has been sent to your inbox. If you can't find it, check your spam.</p>
            </div>
            <div>
            <button className="bg-main text-white hover:text-black shadow-lg 
            shadow-main/50 rounded-lg w-80 hover:bg-wood cursor-pointer border-2 border-black"
            onClick={toLogin}>Back to Login</button>
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
            </div>
        </div>
    );
};

export default SignUpSubmission;