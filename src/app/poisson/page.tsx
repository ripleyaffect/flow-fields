import { PoissonEditor } from '~/components/flow-fields/poisson-editor';


export default function PoissonPage() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="container">
        <PoissonEditor />
      </div>
    </main>
  )
}
