export function renderTemplate(title: string, styles: string, mdClass: string, html: string, scripts: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
${styles}
</head>
<body class="${mdClass}">
<div class="content">
    ${html}
</div>
${scripts}
</body>
</html>
`;
}