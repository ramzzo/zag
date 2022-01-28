import { injectGlobal } from "@emotion/css"
import { useActor, useMachine, useSetup, normalizeProps, SolidPropTypes } from "@ui-machines/solid"
import * as Toast from "@ui-machines/toast"
import { createMemo, createSignal, For } from "solid-js"
import { toastStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(toastStyle)

function Loader() {
  return (
    <svg
      className="spin"
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
    >
      <path d="M8 16c-2.137 0-4.146-0.832-5.657-2.343s-2.343-3.52-2.343-5.657c0-1.513 0.425-2.986 1.228-4.261 0.781-1.239 1.885-2.24 3.193-2.895l0.672 1.341c-1.063 0.533-1.961 1.347-2.596 2.354-0.652 1.034-0.997 2.231-0.997 3.461 0 3.584 2.916 6.5 6.5 6.5s6.5-2.916 6.5-6.5c0-1.23-0.345-2.426-0.997-3.461-0.635-1.008-1.533-1.822-2.596-2.354l0.672-1.341c1.308 0.655 2.412 1.656 3.193 2.895 0.803 1.274 1.228 2.748 1.228 4.261 0 2.137-0.832 4.146-2.343 5.657s-3.52 2.343-5.657 2.343z"></path>
    </svg>
  )
}

function ToastItem(props: { actor: Toast.Service }) {
  const [state, send] = useActor(props.actor)
  const toast = createMemo(() => Toast.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className="toast" {...toast().containerProps}>
      <progress max={toast().progress?.max} value={toast().progress?.value} />
      <p {...toast().titleProps}>{toast().title}</p>
      <p>{toast().type === "loading" ? <Loader /> : null}</p>
      <button onClick={toast().dismiss}>Close</button>
    </div>
  )
}

export default function Page() {
  const [state, send] = useMachine(Toast.group.machine)

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const toasts = createMemo(() => Toast.group.connect<SolidPropTypes>(state, send, normalizeProps))
  const [id, setId] = createSignal<string>()

  return (
    <>
      <div ref={ref} style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => {
            const _id = toasts().create({
              title: "Welcome",
              description: "Welcome",
              type: "info",
            })
            setId(_id)
          }}
        >
          Notify (Info)
        </button>
        <button
          onClick={() => {
            toasts().create({
              title: "Ooops! Something was wrong",
              type: "error",
            })
          }}
        >
          Notify (Error)
        </button>
        <button
          onClick={() => {
            if (!id()) return
            toasts().update(id(), {
              title: "Testing",
              type: "loading",
            })
          }}
        >
          Update Child (info)
        </button>
        <button onClick={() => toasts().dismiss()}>Close all</button>
        <button onClick={() => toasts().pause()}>Pause all</button>
        <button onClick={() => toasts().resume()}>Resume all</button>
      </div>

      <div {...toasts().getContainerProps({ placement: "bottom" })}>
        <For each={toasts().toasts}>{(actor) => <ToastItem actor={actor} />}</For>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}