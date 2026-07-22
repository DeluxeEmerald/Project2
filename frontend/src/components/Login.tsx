import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath} from './Path';
import { storeToken, storeUserID } from '../tokenStorage';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';
import heroImage from '../assets/hero.png';
import mtgLogo from '../assets/mtgLogo.png';

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
        <section className='auth-layout'>
            <div className='hero-panel'>
                <span className='hero-kicker'>Collection Workspace</span>
                <h2 className='hero-heading'>Give your Magic collection a better home.</h2>
                <p className='hero-copy'>
                    Open packs, browse your inventory, and organize decks from a warmer interface built around the cards instead of generic forms.
                </p>
                <div className='hero-stats'>
                    <div className='hero-stat'>
                        <strong>Packs</strong>
                        <span>Open and reveal with a more focused presentation.</span>
                    </div>
                    <div className='hero-stat'>
                        <strong>Inventory</strong>
                        <span>Search and manage your collection without clutter.</span>
                    </div>
                    <div className='hero-stat'>
                        <strong>Decks</strong>
                        <span>Keep deck management tied to the cards you own.</span>
                    </div>
                </div>
                <img className='hero-art' src={heroImage} alt='Fantasy card display' />
            </div>

            <div id="loginDiv" className='auth-card stack-lg'>
                <div className='stack'>
                    <img src={mtgLogo} alt='Magic: The Gathering' width="320" className='mx-auto max-w-full' />
                    <div>
                        <h2 className='auth-title'>Sign in</h2>
                        <p className='auth-copy'>Enter your account to continue to packs, inventory, and deck tools.</p>
                    </div>
                </div>

                <div className='auth-form'>
                    <label>
                        <span className='field-label'>Login</span>
                        <input type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName}
                        className='text-input'/>
                    </label>
                    <label>
                        <span className='field-label'>Password</span>
                        <input type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} onKeyDown={e => {if (e.key === "Enter") doLogin(e);}}
                        className='text-input'/>
                    </label>
                    <input type="submit" id="loginButton" value = "Enter Collection" onClick={doLogin}
                    className='primary-button' />
                    <p className='text-black'>Don&apos;t have an account? <button onClick={toSignUp}
                    className='inline-button'>Sign Up</button></p>
                    {message && <span id="loginResult" className='auth-message'>{message}</span>}
                </div>
            </div>
<<<<<<< HEAD
        </section>
=======
            <input type="submit" id="loginButton" value = "Sign In" onClick={doLogin}
            className='bg-main hover:bg-wood text-white hover:text-black rounded-full w-32 border-2 border-black hover:cursor-pointer' />
            <p className='text-black'>Don't have an account? <button onClick={toSignUp}
            className='text-blue-600 underline hover:cursor-pointer'>Sign Up</button></p>
            <span id="loginResult" className='text-marble'>{message}</span>
            <p className='text-black'>Forgot password? <button onClick={toResetPassword}
            className='text-blue-600 underline hover:cursor-pointer'>Reset</button></p>
        </div>
        </div>
>>>>>>> 04be01e36cc669315e7b28f2bb791b68b4845e9c
    );
};

export default Login;