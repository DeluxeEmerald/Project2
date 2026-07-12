//import React, {useState} from 'react';
function Signup(){

    function toLogin(){
        window.location.href = '/';
    }

    return(
        <div id="loginDiv" className='mt-40 flex flex-col items-center bg-main rounded-2xl p-8 max-w-m h-full gap-4'>
        <span id="inner-title" className="font-bold underline ">PLEASE LOG IN</span><br />
        <div className='flex items-center gap-2 text-accent1'>
        <p className='w-32'>First Name*:</p> <input type="text" id="firstName" placeholder="First Name"
        className='bg-white'/>
        </div>
        <div className='flex items-center gap-2 text-accent1'>
        <p className='w-32'>Last Name*:</p> <input type="text" id="lastName" placeholder="Last Name"
        className='bg-white'/>
        </div>
        <div className='flex items-center gap-2 text-accent1'>
        <p className='w-32'>Login*:</p> <input type="text" id="loginName" placeholder="Username"
        className='bg-white'/>
        </div>
        <div className='flex items-center gap-2 text-accent1'>
        <p className='w-32'>Password*:</p> <input type="password" id="loginPassword" placeholder="Password" className='bg-white' />
        </div>
        <input type="submit" id="loginButton" className="bg-accent1 shadow-lg shadow-accent1/50 rounded-lg w-80 hover:bg-accent2 cursor-pointer" value = "Do It"
            onClick={()=>toLogin()} />
        <span id="loginResult" className="text-accent2">Error Here</span>
        </div>
    );
};
export default Signup;