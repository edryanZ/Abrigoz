import "./ContadorAbrigo.css";

import { differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

import {
    FaSeedling,
    FaRocket,
    FaCalendarAlt,
} from "react-icons/fa";

import Ceu from "../../components/Ceu";
import Navbar from "../../components/Navbar";
import Container from "../../components/Container";
import PageHeader from "../../components/PageHeader";
import Section from "../../components/Section";
import GlassCard from "../../components/GlassCard";

import { useTheme } from "../../context/ThemeContext";

export default function ContadorAbrigo() {

    const { greeting } = useTheme();

    const inicio = new Date(2026, 6, 17);

    const hoje = new Date();

    const dias = differenceInDays(
        hoje,
        inicio
    );

    return (
        <>
            <Ceu />

            <Navbar />

            <Container>

                <PageHeader
                    greeting={greeting}
                    title="Contador do Abrigo"
                    subtitle="Cada dia representa um novo passo na história deste projeto."
                />

                <Section>

                    <GlassCard>

                        <h3>
                            <FaCalendarAlt />
                            Data de criação
                        </h3>

                        <p>
                            {format(
                                inicio,
                                "dd 'de' MMMM 'de' yyyy",
                                {
                                    locale: ptBR
                                }
                            )}
                        </p>

                    </GlassCard>

                    <GlassCard>

                        <h3>
                            <FaSeedling />
                            Tempo de desenvolvimento
                        </h3>

                        <h1>{dias} dias</h1>

                        <p>
                            O Abrigo continua evoluindo a cada atualização.
                        </p>

                    </GlassCard>

                    <GlassCard>

                        <h3>
                            <FaRocket />
                            Versão atual
                        </h3>

                        <h2>Abrigo 2.0</h2>

                        <p>
                            Um espaço feito para acolher pessoas.
                        </p>

                    </GlassCard>

                </Section>

                <Section>

                    <GlassCard>

                        <h3>🌿 Sobre o contador</h3>

                        <p>
                            Este contador acompanha o tempo desde o início
                            do desenvolvimento do Abrigo.
                        </p>

                        <p>
                            Cada atualização representa um novo capítulo
                            dessa jornada e aproxima o projeto da ideia
                            que inspirou sua criação: oferecer um lugar
                            acolhedor para qualquer pessoa.
                        </p>

                    </GlassCard>

                </Section>

                <Section>

                    <GlassCard>

                        <blockquote>
                            "Cada atualização torna este lugar um pouco
                            mais acolhedor."
                        </blockquote>

                    </GlassCard>

                </Section>

            </Container>

        </>
    );

}