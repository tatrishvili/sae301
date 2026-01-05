// assets/js/page-loader.js

// Use a data attribute on <body> to identify the page
const body = document.body;
const page = body.dataset.page; // e.g., <body data-page="formulaire">

if (page === 'formulaire') {
    import('./formulaire.js').then(module => {
        module.initFormulaire(); // see below
    });
}

if (page === 'backoffice') {
    import('./backoffice.js').then(module => {
        module.initBackoffice();
    });
}

if (page === 'zone_deplacement') {
    import('./interactive-map.js').then(module => {
        module.initZoneDeplacement();
    });
}
