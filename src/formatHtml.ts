/* https://github.com/permafrost-dev/node-ray/blob/main/src/lib/utils.ts */
/* Copyright © 2021 Permafrost Development under The MIT License (MIT) */

export interface FormatHtmlOptions {
    encodeEntities: boolean;
}

export const formatHtmlForDisplay = (html: string, options: FormatHtmlOptions = { encodeEntities: true }) => {
    if (options.encodeEntities) {
        html = encodeHtmlEntities(html);
    }

    return encodeNewLinesToHtml(
        html.replace(/^(\s+)/gm, m => `${spacesToHtmlSpaces(m)}`), // preserve indentation spaces
    );
};

export const encodeHtmlEntities = (str: string) => {
    const escapeChars: Record<string, string> = {
        '¢': 'cent',
        '£': 'pound',
        '¥': 'yen',
        '€': 'euro',
        '©': 'copy',
        '®': 'reg',
        '<': 'lt',
        '>': 'gt',
        '"': 'quot',
        '&': 'amp',
        "'": '#39',
    };

    const chars: string[] = Object.keys(escapeChars);
    const regex = new RegExp(`[${chars.join('')}]`, 'g');

    return str.replace(regex, m => `&${escapeChars[m]};`);
};

export const spacesToHtmlSpaces = (spaces: string) => {
    return '&nbsp;'.repeat(spaces.length);
};

export const encodeNewLinesToHtml = (str: string) => {
    return str.replace(/(\r\n|\r|\n)/g, '<br>');
};