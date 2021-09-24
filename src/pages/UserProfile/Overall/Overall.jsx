import { useState } from "react";
import { Impact } from "../../../stories/Impact/Impact";
import { Popup } from "../../../stories/Popup/Popup";
import { PopupItem } from "../../../stories/PopupItem/PopupItem";
import './overall.scss';
import 'primeflex/primeflex.css';

export const Overall = ({ trees, ponds }) => {

    const [popup, setPopup] = useState(false);

    const togglePopup = () => {
        setPopup(!popup);
    }

    const getPonds = () => {
        setPopup(!popup)
    }

    const getTrees = () => {
        setPopup(!popup)
    }

    return (
        <div className="overall">
            <Popup display={popup} toggle={togglePopup}>
                <PopupItem />
            </Popup>
            <h2>Overall Impact</h2>
            <div className="p-grid">
                <div
                    className="p-col-12 p-md-3 p-sm-6"
                    style={{ "cursor": "pointer" }}
                    onClick={() => getPonds()}>
                    <Impact count={trees.count} text={"Trees Planted by visitors till date"} />
                </div>
                <div
                    className="p-col-12 p-md-3 p-sm-6"
                    style={{ "cursor": "pointer" }}
                    onClick={() => getTrees()}>
                    <Impact count={"100+"} text={"People employed from local community."} />
                </div>
            </div>
        </div>
    )
}