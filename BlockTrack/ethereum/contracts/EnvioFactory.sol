// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Envio.sol";

contract EnvioFactory {
    address[] private enviosDesplegados;

    mapping(uint256 => address) public envioByRemesaId;

    event EnvioCreado(
        uint256 indexed remesaId,
        address indexed envio,
        address indexed creador
    );

    function crearEnvio(uint256 idRemesa) external returns (address envio) {
        require(idRemesa != 0, "idRemesa requerido");
        require(envioByRemesaId[idRemesa] == address(0), "Remesa ya existe");

        Envio newEnvio = new Envio(idRemesa, msg.sender);
        envio = address(newEnvio);

        envioByRemesaId[idRemesa] = envio;
        enviosDesplegados.push(envio);

        emit EnvioCreado(idRemesa, envio, msg.sender);
        return envio;
    }

    function getEnvioByRemesaId(
        uint256 idRemesa
    ) external view returns (address) {
        return envioByRemesaId[idRemesa];
    }

    function exists(uint256 idRemesa) external view returns (bool) {
        return envioByRemesaId[idRemesa] != address(0);
    }

    function count() external view returns (uint256) {
        return enviosDesplegados.length;
    }

    function getRange(
        uint256 start,
        uint256 size
    ) external view returns (address[] memory slice) {
        uint256 len = enviosDesplegados.length;
        if (start >= len || size == 0) {
            return new address[](0);
        }

        uint256 end = start + size;
        if (end > len) end = len;

        uint256 outLen = end - start;
        slice = new address[](outLen);

        for (uint256 i = 0; i < outLen; i++) {
            slice[i] = enviosDesplegados[start + i];
        }
    }

    function getContratosDesplegados()
        external
        view
        returns (address[] memory)
    {
        return enviosDesplegados;
    }
}
