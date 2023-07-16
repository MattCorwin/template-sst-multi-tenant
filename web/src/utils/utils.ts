export const authedGetCall = async (path: string) => {
  const session = localStorage.getItem("session");
    if (session) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}${path}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session}`,
            },
          }
        );
        return response.json();
      } catch (error) {
        alert(error);
      }
    }
};

export const authedPostCall = async (path: string, body: string) => {
  const session = localStorage.getItem("session");
    if (session) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}${path}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session}`,
            },
            body
          }
        );
        return response.json();
      } catch (error) {
        alert(error);
      }
    }
};
