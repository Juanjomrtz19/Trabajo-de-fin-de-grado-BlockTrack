// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Envio {
    uint256 public remesaId;
    address public enviador;
    address public receptor;
    uint256 public totalTransportistas;

    enum Estado {
        Creada,
        Pendiente,
        EnTransito,
        Entregada,
        Cancelada
    }
    Estado public estado;

    address public poseedorActualRemesa;
    mapping(address => bool) public transportistasAceptados;
    uint256 public totalTransportistasAceptados;

    event EnvioCreado(
        uint256 indexed remesaId,
        address indexed enviador,
        uint256 timestamp
    );
    event EstadoCambiado(
        uint256 indexed remesaId,
        Estado estado,
        uint256 timestamp
    );
    event PoseedorCambiado(
        uint256 indexed remesaId,
        address indexed nuevoPoseedor,
        uint256 timestamp
    );
    event TransportistaAceptado(
        uint256 indexed remesaId,
        address indexed transportista,
        uint256 timestamp
    );
    event TotalTransportistasFijado(
        uint256 indexed remesaId,
        uint256 total,
        uint256 timestamp
    );
    event ReceptorActualizado(
        uint256 indexed remesaId,
        address indexed receptor,
        uint256 timestamp
    );

    modifier onlyEnviador() {
        require(msg.sender == enviador, "Solo enviador");
        _;
    }

    modifier notCancelled() {
        require(estado != Estado.Cancelada, "Pedido cancelado");
        _;
    }

    modifier notEnviadorNotReceptor() {
        require(msg.sender != enviador, "no puede el enviador");
        require(msg.sender != receptor, "no puede el receptor");
        _;
    }

    bool private _entered;
    modifier nonReentrant() {
        require(!_entered, "Reentrancy");
        _entered = true;
        _;
        _entered = false;
    }

    function _configCompletada() internal view returns (bool) {
        return
            receptor != address(0) &&
            totalTransportistas > 0 &&
            totalTransportistasAceptados == totalTransportistas;
    }

    modifier duringSetup() {
        require(
            estado == Estado.Creada && !_configCompletada(),
            "Configuracion cerrada"
        );
        _;
    }

    modifier afterSetup() {
        require(_configCompletada(), "Aun no configurado");
        _;
    }

    constructor(uint256 _remesaId) {
        require(_remesaId != 0, "remesaId requerido");
        remesaId = _remesaId;
        enviador = msg.sender;
        poseedorActualRemesa = msg.sender;
        receptor = address(0);
        estado = Estado.Creada;

        emit EnvioCreado(remesaId, enviador, block.timestamp);
        emit EstadoCambiado(remesaId, estado, block.timestamp);
        emit PoseedorCambiado(remesaId, poseedorActualRemesa, block.timestamp);
    }

    // ---------- Núcleo de máquina de estados ----------
    function _avanzarEstado(Estado _nuevo) internal {
        Estado actual = estado;
        bool ok = (actual == Estado.Creada && _nuevo == Estado.Pendiente) ||
            (actual == Estado.Pendiente && _nuevo == Estado.EnTransito) ||
            (actual == Estado.EnTransito && _nuevo == Estado.Entregada);
        require(ok, "Transicion invalida");
        estado = _nuevo;
        emit EstadoCambiado(remesaId, _nuevo, block.timestamp);
    }

    function _tryFinalizeSetup() internal {
        if (estado == Estado.Creada && _configCompletada()) {
            _avanzarEstado(Estado.Pendiente);
        }
    }

    // ---------- Fase de configuracion ----------
    function setTotalTransportistas(
        uint256 _total
    ) public onlyEnviador notCancelled duringSetup {
        require(_total > 0, "Total debe ser > 0");
        require(
            _total >= totalTransportistasAceptados,
            "Total menor que aceptados"
        );
        totalTransportistas = _total;
        emit TotalTransportistasFijado(remesaId, _total, block.timestamp);

        _tryFinalizeSetup();
    }

    function addTransportistaAceptado()
        public
        notCancelled
        duringSetup
        notEnviadorNotReceptor
    {
        require(totalTransportistas > 0, "Fija el total primero");
        require(!transportistasAceptados[msg.sender], "Ya aceptado");
        require(
            totalTransportistasAceptados < totalTransportistas,
            "Cupo completo"
        );

        transportistasAceptados[msg.sender] = true;
        totalTransportistasAceptados += 1;
        emit TransportistaAceptado(remesaId, msg.sender, block.timestamp);

        _tryFinalizeSetup();
    }

    function setReceptor(
        address _receptor
    ) public onlyEnviador notCancelled duringSetup {
        require(_receptor != address(0), "Receptor invalido");
        require(_receptor != enviador, "Receptor no puede ser enviador");
        require(
            !transportistasAceptados[_receptor],
            "Receptor no puede ser transportista aceptado"
        );

        receptor = _receptor;
        emit ReceptorActualizado(remesaId, _receptor, block.timestamp);

        _tryFinalizeSetup();
    }

    // ---------- Operativa (tras configuracion) ----------
    function _entregar() internal {
        require(receptor != address(0), "Receptor no configurado");
        poseedorActualRemesa = receptor;
        emit PoseedorCambiado(remesaId, receptor, block.timestamp);

        if (estado == Estado.Pendiente) {
            _avanzarEstado(Estado.EnTransito);
        }
        if (estado == Estado.EnTransito) {
            _avanzarEstado(Estado.Entregada);
        }
    }

    function entregarPedido() public notCancelled nonReentrant afterSetup {
        require(msg.sender == poseedorActualRemesa, "Solo el poseedor actual");
        _entregar();
    }

    function cambiarPoseedor(
        address _nuevoPoseedor
    ) public notCancelled nonReentrant afterSetup {
        require(msg.sender == poseedorActualRemesa, "Solo el poseedor actual");
        require(_nuevoPoseedor != address(0), "Poseedor invalido");
        require(
            _nuevoPoseedor == receptor ||
                transportistasAceptados[_nuevoPoseedor],
            "Poseedor no autorizado"
        );

        if (_nuevoPoseedor == receptor) {
            _entregar();
            return;
        }

        poseedorActualRemesa = _nuevoPoseedor;
        emit PoseedorCambiado(remesaId, _nuevoPoseedor, block.timestamp);

        if (estado == Estado.Pendiente) {
            _avanzarEstado(Estado.EnTransito);
        }
    }

    function cancelarPedido() public onlyEnviador {
        require(estado != Estado.Cancelada, "Ya cancelado");
        require(estado != Estado.Entregada, "No puede cancelarse entregado");
        estado = Estado.Cancelada;
        emit EstadoCambiado(remesaId, Estado.Cancelada, block.timestamp);
    }
}
