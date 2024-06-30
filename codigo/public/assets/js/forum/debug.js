import { getLikeRelationship } from './api/likes.js';

$(() =>
{
    getLikeRelationship('707a', '0', data => console.log(data));
});
    