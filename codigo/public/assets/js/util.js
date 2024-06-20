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

export { generateUniqueId, getDate, infiniteScroll, throttle };

