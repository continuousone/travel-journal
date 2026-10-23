import { optimizedImage } from "../lib/cloudinary"

export default function Entry(props) {
    return (
        <article className="journal-entry">
            <div className="main-image-container">
                <img
                    className="main-image"
                    src={optimizedImage(props.img.src, 400)}
                    alt={props.img.alt}
                />
            </div>
            <div className="info-container">
                <img
                    className="marker"
                    src="/images/marker.png"
                    alt="map marker icon"
                />
                <span className="country">{props.country}</span>
                {props.googleMapsLink && (
                    <a href={props.googleMapsLink} target="_blank" rel="noreferrer">View on Google Maps</a>
                )}
                <h2 className="entry-title">{props.title}</h2>
                <p className="trip-dates">{props.dates}</p>
                <p className="entry-text">{props.text}</p>
            </div>
        </article>
    )
}
