import "./CartaAberta.css";

export default function CartaAberta({

    aberta,

    carta,

    categoria,

    onClose

}){

    if(!aberta || !carta) return null;

    return(

        <section className="carta-aberta">

            <button

                className="voltar"

                onClick={onClose}

            >

                ✕

            </button>

            <div className="folha">

                <span className="categoria">

                    {categoria.emoji}

                    {" "}

                    {categoria.nome}

                </span>

                <h1>

                    {carta.titulo}

                </h1>

                <article>

                    {carta.texto}

                </article>

                <footer>

                    {carta.assinatura}

                </footer>

            </div>

        </section>

    );

}