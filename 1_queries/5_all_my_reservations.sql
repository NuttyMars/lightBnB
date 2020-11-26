SELECT reservations.*, properties.*, AVG(rating) AS average_rating
FROM property_reviews
JOIN reservations ON reservations.id = property_reviews.reservation_id
JOIN properties ON properties.id = reservations.property_id
WHERE reservations.guest_id = 1
AND reservations.end_date < now()::date
GROUP BY reservations.id, properties.id
ORDER BY reservations.start_date
LIMIT 10;