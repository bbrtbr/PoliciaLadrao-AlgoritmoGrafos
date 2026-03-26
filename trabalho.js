class Grafo {
    constructor(numVertices) {
        this.qtd = numVertices;
        this.arestas = [];
        this.adj = [];
        
        for (let i = 0; i < numVertices; i++) {
            this.adj.push([]);
        }
    }

    novaAresta(de, para, custo) {
        this.arestas.push({ de, para, custo });
        this.adj[de].push({ vizinho: para, peso: custo });
    }

    rodarBellmanFord(inicio) {
        let dist = [];
        let antes = [];
        
        for (let i = 0; i < this.qtd; i++) {
            dist[i] = Infinity;
            antes[i] = null;
        }
        dist[inicio] = 0;

        // Loop principal do BF
        for (let i = 0; i < this.qtd - 1; i++) {
            for (let j = 0; j < this.arestas.length; j++) {
                let a = this.arestas[j];
                if (dist[a.de] !== Infinity && dist[a.de] + a.custo < dist[a.para]) {
                    dist[a.para] = dist[a.de] + a.custo;
                    antes[a.para] = a.de;
                }
            }
        }
        
        return [dist, antes];
    }

    montarRota(antes, inicio, fim) {
        let rota = [];
        let atual = fim;
        
        while (atual !== null) {
            rota.push(atual);
            if (atual === inicio) break;
            atual = antes[atual];
        }
        
        rota.reverse(); 
        
        if (rota[0] !== inicio) return null;
        return rota;
    }
}

class JogoFuga {
    constructor(mapa, posLadrao, escapes, posPolicia) {
        this.mapa = mapa;
        this.ladrao = posLadrao;
        this.escapes = escapes;
        
        // clona o array
        this.policias = posPolicia.slice(); 
        
        this.historicoLadrao = [posLadrao];
        this.historicoPolicia = posPolicia.map(p => [p]);
        this.rodada = 0;
    }

    passoLadrao() {
        let bf = this.mapa.rodarBellmanFord(this.ladrao);
        let dist = bf[0];
        let antes = bf[1];
        

        let objetivo = null;
        let menorDist = Infinity;

        // Procura a fuga mais favorável
        for (let i = 0; i < this.escapes.length; i++) {
            let s = this.escapes[i];
            if (dist[s] < menorDist) {
                menorDist = dist[s];
                objetivo = s;
            }
        }

        if (objetivo === null) return this.ladrao; 

        let caminho = this.mapa.montarRota(antes, this.ladrao, objetivo);
        
        if (caminho && caminho.length > 1) {
            return caminho[1];
        }
        return this.ladrao;
    }

    passoPolicia(idx) {
        let posicaoAtual = this.policias[idx];
        let bf = this.mapa.rodarBellmanFord(posicaoAtual);
        let antes = bf[1];
        
        let caminho = this.mapa.montarRota(antes, posicaoAtual, this.ladrao);
        
        if (!caminho || caminho.length === 1) return posicaoAtual;
        
        // Policial corre 2 espaços
        if (caminho.length > 2) {
            return caminho[2];
        } 
        return caminho[1];
    }

    iniciar() {
        let preso = false;
        let fugiu = false;

        while (!preso && !fugiu) {
            this.rodada++;

            // ladrao corre
            this.ladrao = this.passoLadrao();
            this.historicoLadrao.push(this.ladrao);

            if (this.policias.indexOf(this.ladrao) !== -1) {
                preso = true; 
                break;
            }
            if (this.escapes.indexOf(this.ladrao) !== -1) {
                fugiu = true; 
                break;
            }

            // pulo dos policiais
            for (let i = 0; i < this.policias.length; i++) {
                this.policias[i] = this.passoPolicia(i);
                this.historicoPolicia[i].push(this.policias[i]);
                
                if (this.policias[i] === this.ladrao) {
                    preso = true;
                }
            }
            
            if (preso) break;
        }

        this.imprimirFim(preso, fugiu);
    }

    imprimirFim(preso, fugiu) {
        console.log("=== FIM DE JOGO ===");
        if (preso) {
            console.log("Pegaram o ladrão na rodada " + this.rodada + "!");
        } else if (fugiu) {
            console.log("Ladrão escapou na rodada " + this.rodada + "!");
        } else {
            console.log("Deu empate / loop.");
        }
        
        console.log("Rota do ladrão: " + this.historicoLadrao.join(" -> "));
        
        for (let i = 0; i < this.historicoPolicia.length; i++) {
            console.log("Rota da viatura " + (i + 1) + ": " + this.historicoPolicia[i].join(" -> "));
        }
        console.log("===================");
    }
}


let qtdNos = 7; 
let grafo = new Grafo(qtdNos);

grafo.novaAresta(0, 1, -1);
grafo.novaAresta(1, 2, -1);
grafo.novaAresta(2, 3, -1);
grafo.novaAresta(4, 5, 1);
grafo.novaAresta(5, 6, 1);
grafo.novaAresta(6, 1, 1); 
grafo.novaAresta(6, 2, 1);

let posInicialLadrao = 0; 
let possiveisSaidas = [2]; 
let posIniciaisPolicia = [4]; 

let sim = new JogoFuga(grafo, posInicialLadrao, possiveisSaidas, posIniciaisPolicia);
sim.iniciar();