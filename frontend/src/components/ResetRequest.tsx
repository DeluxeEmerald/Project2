import { useState } from 'react';
import { buildPath } from './Path';

function RequestReset() {
  const [message,setMessage] = useState('');

    async function callReset(){
        const email = (document.getElementById("email") as HTMLInputElement)?.value || '';
        var obj = {email: email};
        var js = JSON.stringify(obj);

        const response = await fetch(buildPath('api/requestpasswordreset'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
                
            var res = JSON.parse(await response.text());
            if( res.error && res.error.length > 0 )
                {
                    setMessage(res.error);
                }
                else
                {
                   setMessage("A link has been sent to your inbox, if you can't find it check your spam"); 
                }
            

    }

  return (
    <div id="loginDiv" className='mt-40 flex flex-col items-center rounded-2xl p-8 max-w-m h-full gap-4'>
        <span id="inner-title" className="font-bold underline text-marble">Please Enter your email to reset your password</span><br />
        <span id="inner-title" className="font-bold text-marble">Required Fields are 
            <p className="text-magic">Marked*</p></span><br />
        <div className='flex items-center gap-2 text-magic'>
        <p className='w-32'>Email*:</p> <input type="text" id="email" placeholder="Email"
        className='bg-white'/>
        </div>
      <input type="submit" id="loginButton" 
      className="bg-main shadow-lg shadow-main/50 rounded-lg w-80 hover:bg-wood 
      cursor-pointer" value = "Reset Password" onClick={callReset}/>
       <span id="loginResult">{message}</span>
    </div>
  );
}

export default RequestReset;