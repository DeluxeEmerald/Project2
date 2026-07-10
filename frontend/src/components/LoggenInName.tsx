function LoggedInName()
{
    function doLogout(event:any) : void
    {
        event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    return(
    <div id="loggedInDiv" className="flex">
        <div className="top-heading irish-grover-regular padding:10px">Magic Collectors</div>
        <div className="flex">
            <span className="top-heading irish-grover-regular padding:10px" id="userName">Logged In As John Doe</span>
            <button type="button" id="logoutButton" className="buttons"
            onClick={doLogout}> Log Out </button>
        </div>
    </div>
    );
};

export default LoggedInName;