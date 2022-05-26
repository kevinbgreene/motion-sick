import { Motion } from "./Motion";

const el = document.querySelector(".box");

if (el == null) {
  throw new Error();
}

const motion1 = Motion.create({
  element: el,
  frames: [
    {
      offset: 0.5,
      height: "300px",
      opacity: 0.5,
      transform: "translate(600px, 200px)",
    },
  ],
});

const motion2 = Motion.create({
  element: el,
  frames: [
    {
      offset: 1.0,
      width: "300px",
      height: "400px",
      transform: "rotate(40deg) translate(300px, 400px)",
    },
    {
      offset: 0.5,
      transform: "rotate(-40deg) translate(400px, 200px)",
    },
  ],
});

const motion3 = motion1.chain(motion2);

console.log({ motion3 });

const motion4 = motion2.chain(motion2.reverse());

document.addEventListener("click", async () => {
  if (motion4.playState === "running") {
    console.log("pause: ", motion4);
    motion4.pause();
  } else {
    console.log("play: ", motion4);
    await motion4.play();
    console.log("done 1");
  }
});
