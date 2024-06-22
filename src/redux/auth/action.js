export const checkeduserloggedin = () => async (dispatch) => {
    try {
        dispatch({
            type: "checkuserloggedpending"
        })
        const data = await fetch(`${import.meta.env.VITE_API_URL}/auth/checkLoggedIn`, {
            method: "GET",
            credentials: "include"
        })
        const res = await data.json()
        console.log(res);
        if (res.loggedIn) {
            dispatch({
                type: "checkuserloggedsuccess",
                payload: res.user
            })
        }
        else {
            dispatch({
                type: "checkuserloggedrejected",
                payload: {
                    status: true,
                    error: "Permission Denied"
                }
            })
        }
    } catch (error) {
        console.log(error);
        dispatch({
            type: "checkuserloggedrejected",
            payload: {
                status: true,
                error: "Internal Server Error"
            }
        })
    }
}

export const logout = () => async (dispatch) => {
    try {
        dispatch({
            type: "logoutpending"
        })
        const data = await fetch("http://localhost:5000/logout", {
            method: "GET",
            credentials: "include"
        })
        const res = await data.json()
        if (res.msg === "user logout successfully") {
            dispatch({
                type: "logoutsuccess",
                payload: null
            })
        }
        else {
            dispatch({
                type: "logoutrejected",
            })
        }
    } catch (error) {
        console.log(error);
        dispatch({
            type: "logoutrejected"
        })
    }
}