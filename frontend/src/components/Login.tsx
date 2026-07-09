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
        <div id="loginDiv" className='flex items-center bg-white rounded-3xl p-8 max-w-m mx-auto h-100 gap-4 centered'>
        <div id="leftLoginContent"><img src="src/assets/cardStack.png" alt="Magic: The Gathering Logo" width="300"></img></div>
        <div id="rightLoginContent" className='flex-col items-center'>
            <img src="src/assets/mtgLogo.png" alt="Magic: The Gathering Logo" width="400"></img><br />
            <div className='bg-red-50 flex items-center gap-2'>
            Login: <input type="text" id="loginName" placeholder="Username" onChange={handleSetLoginName}
            className=''/>
            </div>
            <div className='bg-red-50 flex items-center gap-2'>
            Password: <input type="password" id="loginPassword" placeholder="Password" onChange={handleSetPassword} />
            </div>
            <input type="submit" id="loginButton" className="buttons" value = "Do It"
                onClick={doLogin} />
            <span id="loginResult">{message}</span>
        </div>
        </div>
    );
};

export default Login;