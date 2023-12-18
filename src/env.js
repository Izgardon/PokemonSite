function loadEnvironmentVariables() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '.env', false);
    xhr.send();

    if (xhr.status === 200) {
        const lines = xhr.responseText.split('\n');
        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                window[parts[0]] = parts[1];
            }
        });
    }
}

loadEnvironmentVariables();
