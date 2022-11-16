import { Type } from "../../constant";

const types = [
  { name: "Not Select", value: "Not Select" },
  { name: Type.Camera, value: Type.Camera },
  { name: Type.Image, value: Type.Image },
  { name: Type.VideoSolo, value: Type.VideoSolo },
  { name: Type.VideoGroup, value: Type.VideoTeam },
];

const Options = (props) => {
  const { _onSetSelected, _onClear } = props;

  const onOptionChange = (event) => {
    const { value } = event.target;
    _onSetSelected(value);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignSelf: "flex-end",
        margin: "0.5rem",
        padding: "0.5rem",
        background: "rgba(0,0,0,0.4)",
        borderRadius: "4px",
        width: "50%",
        gap: "0.5rem",
      }}
    >
      <select onChange={onOptionChange}>
        {types.map((t) => {
          return (
            <option key={t.name} value={t.value}>
              {t.name}
            </option>
          );
        })}
      </select>
      <button onClick={_onClear}>clear</button>
    </div>
  );
};

export default Options;
