import React, {useState} from 'react';

function Login()
{
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();
        
        var obj = {login:loginName,password:loginPassword};
        var js = JSON.stringify(obj);
        
        try
        {
            const response = await fetch('http://localhost:5000/api/login',
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            
            var res = JSON.parse(await response.text());
            
            if( res.id <= 0 )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                var user = 
                {firstName:res.firstName,lastName:res.lastName,id:res.id}
                localStorage.setItem('user_data', JSON.stringify(user));
                
                setMessage('');
            
                window.location.href = '/cards';
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

    return(
        <div id="loginDiv" className='mt-40 flex flex-col items-center bg-main rounded-2xl p-8 max-w-m h-full gap-4'>
        <span id="inner-title" className="font-bold underline text-accent2">PLEASE LOG IN</span><br />
        <div className='flex items-center gap-2 text-accent1'>
        Login*: <input type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName}
        className='bg-white'/>
        </div>
        <div className='flex items-center gap-2 text-accent1'>
        Password*: <input type="password" id="loginPassword" placeholder="Password" className='bg-white' onChange={handleSetPassword} />
        </div>
        <input type="submit" id="loginButton" className="bg-accent1 shadow-lg shadow-accent1/50 rounded-lg w-80 hover:bg-accent2" value = "Do It"
            onClick={doLogin} />
        <span id="loginResult" className="text-accent2">{message}</span>
        </div>
    );
};

export default Login;