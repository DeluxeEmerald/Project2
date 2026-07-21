import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath} from './Path';
import { storeToken, storeUserID } from '../tokenStorage';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload
{
  name: string;
  userId: string;
}

function Login()
{
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');
    const navigate = useNavigate();


    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();
        
        var obj = {name:loginName,password:loginPassword};
        var js = JSON.stringify(obj);
        
        try
        {
            const response = await fetch(buildPath('api/login'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
            
            var res = JSON.parse(await response.text());
            
            if( res.error && res.error.length > 0 )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                const { accessToken } = res;
                    storeToken(accessToken);

                    const decoded = jwtDecode<CustomJwtPayload>(accessToken);
                    var user = { name: decoded.name, id: decoded.userId };
                    storeUserID(JSON.stringify(user));

                    setMessage('');
                    navigate('/packs');
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }         
    };

    function handleSetLoginName( e: any ) : void
    {
        setLoginName( e.target.value );
    }
    
    function handleSetPassword( e: any ) : void
    {
        setPassword( e.target.value );
    }

    function toSignUp(){
        navigate('/signup');
    }

    function toResetPassword(){
        navigate('/requestreset');
    }

    return(
        <div id="loginDiv" className='flex items-center bg-white rounded-3xl p-8 max-w-m mx-auto h-100 gap-4 centered mt-20'>
        <div id="leftLoginContent"><img src="src/assets/cardStack.png" alt="Magic: The Gathering Logo" width="300"></img></div>
        <div id="rightLoginContent" className='flex flex-col items-center gap-3'>
            <img src="src/assets/mtgLogo.png" alt="Magic: The Gathering Logo" width="400"></img><br />
            <div className='flex items-center gap-2 text-black'>
                <p className='w-28'>Login*:</p>
                <input type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName}
                className='bg-white'/>
            </div>
            <div className='flex items-center gap-2 text-black'>
                <p className='w-28'>Password*:</p>
                <input type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} onKeyDown={e => {if (e.key === "Enter") doLogin(e);}}
                className='bg-white'/>
            </div>
            <input type="submit" id="loginButton" value = "Sign In" onClick={doLogin}
            className='bg-main hover:bg-accent2 text-black rounded-full w-16 border-2 border-black hover:cursor-pointer' />
            <p className='text-black'>Don't have an account? <button onClick={toSignUp}
            className='text-blue-600 underline hover:cursor-pointer'>Sign Up</button></p>
            <span id="loginResult">{message}</span>
            <p className='text-black'>Forgot password? <button onClick={toResetPassword}
            className='text-blue-600 underline hover:cursor-pointer'>Reset</button></p>
            <span id="loginResult">{message}</span>
        </div>
        </div>
    );
};

export default Login;