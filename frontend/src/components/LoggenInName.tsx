function LoggedInName()
{
    function doLogout(event:any) : void
    {
        event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    return(
    <div id="loggedInDiv" className='flex'>
        <h1 className='ml-2'>Magic Collectors</h1>
        <span id="userName" className='ml-96'>Logged In As John Doe </span><br />
        <button type="button" id="logoutButton" className="bg-accent1 rounded-full w-24 ml-10"
            onClick={doLogout}> Log Out </button>
    </div>
    );
};

export default LoggedInName;