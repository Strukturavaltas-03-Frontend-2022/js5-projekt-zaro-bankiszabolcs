const getData = async (url) => {
  try {
    const resolve = await fetch(url);
    const result = await resolve.json();
    return result;
  } catch (error) {
    console.error("Hiba történt az adatbázis betöltésekor");
    return "";
  }
};

export default await getData("http://localhost:3000/users");
