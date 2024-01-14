import { GeneratorEditor } from '~/components/flow-fields/generator';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="container">
        <GeneratorEditor />
      </div>
    </main>
  )
}
