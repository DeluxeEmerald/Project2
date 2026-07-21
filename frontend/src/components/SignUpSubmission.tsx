function SignUpSubmission()
{
    function toLogin(){
        window.location.href = '/';
    }

    return(
        <div id="loginDiv" className='flex flex-col items-center bg-white text-black rounded-3xl p-8 max-w-m mx-auto h-100 gap-4 centered mt-20'>
            <div>
                <p>You have been sent a verification email has been sent to your inbox. If you can't find it, check your spam.</p>
            </div>
            <div>
            <button className="bg-main shadow-lg shadow-main/50 rounded-lg w-80 hover:bg-wood cursor-pointer"
            onClick={toLogin}>Back to Login</button>
            </div>
        </div>
    );
};

export default SignUpSubmission;