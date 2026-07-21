import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { buildPath } from './Path';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  async function submitPassword()  : Promise<void>{
    const token = searchParams.get('token');

    var obj = {token: token,password:password};
    var js = JSON.stringify(obj);

    try{
        if(validatePassword()){
            const response = await fetch(buildPath('api/resetpassword'), {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: js })

            if(!response.ok) {
                setStatus(response.status);
                return;
            }

            var res = JSON.parse(await response.text());

            if( res.error && res.error.length > 0 )
                {
                    setStatus(res.error);
                }
                else
                {
                   setStatus("Password Reset"); 
                }
            }
    }
    catch(error:any)
    {
                alert(error.toString());
                return;
    }
    }

    function toLogin(){
        navigate('/');
    }
    

  function validatePassword(){
        const minLength = 8;
        const upperCase = /[A-Z]/;
        const specialCharacters = /[!@#$%^&*(),.?":{}|<>_\-+=[\];'~`]/g;

        const errors = [];

        if (password.length < minLength){
            errors.push("Password must be at least 8 characters long.");
        }

        if (!upperCase.test(password)){
            errors.push("Password must contain at least 1 uppercase letter.")
        }
        
        const specialCharMatches = password.match(specialCharacters) || [];
        if (specialCharMatches.length < 2) {
            errors.push("Password must contain at least 2 special characters.");
        }

        setErrors(errors);
        return errors.length === 0;
    }

  return (
    <div id="loginDiv" className='mt-40 flex flex-col items-center rounded-2xl p-8 max-w-m h-full gap-4'>
        <span id="inner-title" className="font-bold underline text-marble">Reset Password</span><br />
        <span id="inner-title" className="font-bold text-marble">Required Fields are 
            <p className="text-magic">Marked*</p></span><br />
        <div className='flex items-center gap-2 text-magic'>
        <p className='w-32'>New Password*:</p> <input type="password" id="password" placeholder="New Password"
        value = {password} onChange={(e) => setPassword(e.target.value)}
        className='bg-white'/>
        </div>
      <input type="submit" id="loginButton" className="bg-main text-white hover:text-black shadow-lg shadow-main/50 
      rounded-lg w-80 hover:bg-wood cursor-pointer border-2 border-black" value = "Reset Password"
      onClick={submitPassword}/>
      <p className="text-marble">{status}</p>
      <span id="loginResult" className="text-marble">
            {errors.map((err, index) => 
                (<p key = {index}>{err}</p>))}</span>
        <button onClick={toLogin}
        className="bg-wood shadow-lg shadow-main/50 text-black hover:text-white border-2 border-black
        rounded-lg w-80 hover:bg-main cursor-pointer"
        >Back to Login</button>
    </div>
  );
}

export default ResetPassword;