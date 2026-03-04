async function loadHTML(id, path) {
    try {
        const response = await fetch(path);
        if (response.ok) {
            const text = await response.text();
            document.getElementById(id).innerHTML = text;
        }
    } catch (error) {
        console.error("파일 로딩 실패:", error);
    }
}