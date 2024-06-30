let throttleTimer;

function generateUniqueId()
{
    let d = new Date().getTime();//Timestamp
    let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
    {
        let r = Math.random() * 16;//random number between 0 and 16
        if (d > 0)
        {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else
        {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function throttle(callback, time)
{
    if (throttleTimer)
        return;

    const loaderContainerEl = $('.loader-container');

    loaderContainerEl.removeClass('hidden');

    throttleTimer = true;

    setTimeout(() =>
    {
        callback();

        throttleTimer = false;

        loaderContainerEl.addClass('hidden');
    }, time);
}

function infiniteScroll(call, ...parameters)
{
    throttle(() =>
    {
        const $window = $(window);

        const endOfPage = $window.innerHeight() + $window.scrollTop() >= $('body').offset().top;

        if (endOfPage)
            call(...parameters);
    }, 1000);
}

function getDate()
{
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    if (day < 10)
        day = `0${day}`;

    if (month < 10)
        month = `0${month}`;

    return `${day}/${month}/${year}`;
}

function dateToStringFormatted(date)
{
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    if (day < 10)
        day = `0${day}`;

    if (month < 10)
        month = `0${month}`;

    return `${day}/${month}/${year}`;
}

function dateToString(date)
{
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function getRemainingDays(dateString)
{
    const today = new Date();

    const parts = dateString.split('-');

    const term = new Date(dateString);

    term.setHours(term.getHours() + 3);

    today.setHours(0, 0, 0, 0);
    term.setHours(0, 0, 0, 0);

    const timeDifference = term - today;
    const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return days;
}

function analyzePasswordStrength(password)
{
    let strength = 0;
    let suggestions = [];

    // Criteria for password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const minLength = password.length >= 8;

    // Increment strength based on criteria met
    if (hasUpperCase) strength++;
    else suggestions.push('letras maiúsculas');

    if (hasLowerCase) strength++;
    else suggestions.push('letras minúsculas');

    if (hasNumber) strength++;
    else suggestions.push('números');

    if (hasSpecialChar) strength++;
    else suggestions.push('caracteres especiais');

    if (minLength) strength++;
    else
    {
        suggestions.push('8 caracteres ou mais');
        strength--;
    }

    return { strength, suggestions };
}

export { analyzePasswordStrength, dateToString, dateToStringFormatted, generateUniqueId, getDate, getRemainingDays, infiniteScroll, throttle };

